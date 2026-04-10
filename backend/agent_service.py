import json
import os
import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from eth_account import Account
from web3 import Web3


TRANSFER_PATTERN = re.compile(
    r"send\s+(?P<amount>[0-9]+(?:\.[0-9]+)?)\s*xtz\s+to\s+(?P<target>0x[a-fA-F0-9]{40})",
    re.IGNORECASE,
)
CALL_PATTERN = re.compile(
    r"call\s+(?P<target>0x[a-fA-F0-9]{40})\s+with\s+data\s+(?P<data>0x[a-fA-F0-9]*)",
    re.IGNORECASE,
)
ZERO_HEX = "0x"


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


@dataclass
class ServiceConfig:
    rpc_url: str
    chain_id: int
    board_address: str
    private_key: str
    host: str
    port: int

    @classmethod
    def from_env(cls) -> "ServiceConfig":
        cwd = Path.cwd()
        _load_env_file(cwd / ".env")
        _load_env_file(cwd / ".env.example")
        return cls(
            rpc_url=os.getenv("ETHERLINK_RPC_URL", "https://node.shadownet.etherlink.com"),
            chain_id=int(os.getenv("ETHERLINK_CHAIN_ID", "127823")),
            board_address=os.getenv("BOARD_ADDRESS", ""),
            private_key=os.getenv("PRIVATE_KEY", ""),
            host=os.getenv("HOST", "0.0.0.0"),
            port=int(os.getenv("PORT", "8788")),
        )


class AgentSafeService:
    def __init__(self, config: ServiceConfig):
        self.config = config
        self.w3 = Web3(Web3.HTTPProvider(config.rpc_url))
        self.board = None
        self.account = Account.from_key(config.private_key) if config.private_key else None
        if config.board_address:
            manifest = json.loads(
                (Path(__file__).resolve().parents[1] / "docs" / "lovable-contract-manifest.etherlink-shadownet.json").read_text()
            )
            abi = manifest["contracts"]["AgentProposalBoard"]["abi"]
            self.board = self.w3.eth.contract(address=Web3.to_checksum_address(config.board_address), abi=abi)

    def preview(self, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_payload(payload)
        result = {
            "intent": payload.get("intent", ""),
            "normalized": normalized,
            "submitReady": False,
            "policyCheck": None,
        }

        if self.board:
            allowed = self.board.functions.checkActionAgainstPolicy(
                normalized["vaultId"],
                normalized["target"],
                normalized["valueWei"],
                bytes.fromhex(normalized["dataHex"][2:]),
                normalized["actionType"],
            ).call()
            result["policyCheck"] = {"allowed": bool(allowed)}
            result["submitReady"] = bool(allowed)
        return result

    def submit(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.board or not self.account:
            raise RuntimeError("BOARD_ADDRESS and PRIVATE_KEY are required for onchain submission")

        normalized = self._normalize_payload(payload)
        allowed = self.board.functions.checkActionAgainstPolicy(
            normalized["vaultId"],
            normalized["target"],
            normalized["valueWei"],
            bytes.fromhex(normalized["dataHex"][2:]),
            normalized["actionType"],
        ).call()
        if not allowed:
            raise RuntimeError("Action does not satisfy the current policy")

        nonce = self.w3.eth.get_transaction_count(self.account.address)
        tx = self.board.functions.submitProposal(
            normalized["vaultId"],
            normalized["target"],
            normalized["valueWei"],
            bytes.fromhex(normalized["dataHex"][2:]),
            normalized["actionType"],
            normalized["reason"],
            normalized["expiresAt"],
        ).build_transaction(
            {
                "from": self.account.address,
                "chainId": self.config.chain_id,
                "nonce": nonce,
                "gasPrice": self.w3.eth.gas_price,
            }
        )
        tx["gas"] = int(self.w3.eth.estimate_gas(tx) * 12 // 10)

        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "txHash": tx_hash.hex(),
            "status": receipt.status,
            "submitter": self.account.address,
            "normalized": normalized,
        }

    def _normalize_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        vault_id = int(payload["vaultId"])
        intent = str(payload.get("intent", "")).strip()
        action_type = payload.get("actionType")
        target = payload.get("target")
        data_hex = str(payload.get("data", ZERO_HEX) or ZERO_HEX)
        reason = str(payload.get("reason", "")).strip()

        if action_type is None:
            action_type = self._infer_action_type(intent, data_hex)

        if not target:
            target = self._extract_target(intent, action_type)
        target = Web3.to_checksum_address(target)

        value_wei = self._extract_value_wei(payload, intent)
        if action_type == 0:
            data_hex = ZERO_HEX
        else:
            data_hex = self._extract_calldata(intent, data_hex)

        expires_at = int(payload.get("expiresAt", 0))
        if expires_at == 0:
            expires_at = int(self.w3.eth.get_block("latest")["timestamp"]) + 3600

        if not reason:
            reason = self._build_reason(intent, action_type, target, value_wei)

        return {
            "vaultId": vault_id,
            "actionType": int(action_type),
            "target": target,
            "valueWei": value_wei,
            "valueXtz": str(Decimal(value_wei) / Decimal(10**18)),
            "dataHex": data_hex,
            "reason": reason,
            "expiresAt": expires_at,
        }

    def _infer_action_type(self, intent: str, data_hex: str) -> int:
        if data_hex and data_hex != ZERO_HEX:
            return 1
        if CALL_PATTERN.search(intent):
            return 1
        return 0

    def _extract_target(self, intent: str, action_type: int) -> str:
        if action_type == 0:
            match = TRANSFER_PATTERN.search(intent)
            if not match:
                raise RuntimeError("Could not determine transfer recipient from the intent")
            return match.group("target")

        match = CALL_PATTERN.search(intent)
        if not match:
            raise RuntimeError("Could not determine contract target from the intent")
        return match.group("target")

    def _extract_value_wei(self, payload: dict[str, Any], intent: str) -> int:
        if "valueWei" in payload and payload["valueWei"] is not None:
            return int(payload["valueWei"])
        if "valueXtz" in payload and payload["valueXtz"] is not None:
            return self._xtz_to_wei(str(payload["valueXtz"]))

        match = TRANSFER_PATTERN.search(intent)
        if match:
            return self._xtz_to_wei(match.group("amount"))
        return 0

    def _extract_calldata(self, intent: str, data_hex: str) -> str:
        if data_hex and data_hex != ZERO_HEX:
            return data_hex
        match = CALL_PATTERN.search(intent)
        if not match:
            raise RuntimeError("Contract calls require calldata")
        return match.group("data")

    def _build_reason(self, intent: str, action_type: int, target: str, value_wei: int) -> str:
        if intent:
            return intent
        if action_type == 0:
            return f"AI prepared a native transfer of {Decimal(value_wei) / Decimal(10**18)} XTZ to {target}."
        return f"AI prepared a contract call to {target}."

    def _xtz_to_wei(self, value: str) -> int:
        try:
            amount = Decimal(value)
        except InvalidOperation as exc:
            raise RuntimeError("Invalid XTZ amount") from exc
        return int(amount * Decimal(10**18))


def write_json(handler: BaseHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def run_server() -> None:
    service = AgentSafeService(ServiceConfig.from_env())

    class Handler(BaseHTTPRequestHandler):
        def do_OPTIONS(self) -> None:  # noqa: N802
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_GET(self) -> None:  # noqa: N802
            if self.path == "/health":
                write_json(
                    self,
                    200,
                    {
                        "ok": True,
                        "rpcUrl": service.config.rpc_url,
                        "chainId": service.config.chain_id,
                        "boardConfigured": bool(service.board),
                        "submitConfigured": bool(service.account),
                    },
                )
                return
            write_json(self, 404, {"error": "not_found"})

        def do_POST(self) -> None:  # noqa: N802
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(content_length) or "{}")
                if self.path == "/agent/proposal-preview":
                    write_json(self, 200, service.preview(payload))
                    return
                if self.path == "/agent/proposal-submit":
                    write_json(self, 200, service.submit(payload))
                    return
                write_json(self, 404, {"error": "not_found"})
            except Exception as exc:  # pragma: no cover - runtime path
                write_json(self, 400, {"error": str(exc)})

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
            return

    server = ThreadingHTTPServer((service.config.host, service.config.port), Handler)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
