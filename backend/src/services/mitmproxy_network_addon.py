import json
import sys
from datetime import datetime, timezone
from urllib import error as urllib_error
from urllib import request as urllib_request

AGENTGUARD_NETWORK_EVENTS_URL = "http://localhost:5000/api/network-events"


def _safe_iso_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _send_event(payload):
    body = json.dumps(payload).encode("utf-8")
    req = urllib_request.Request(
        AGENTGUARD_NETWORK_EVENTS_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib_request.urlopen(req, timeout=5) as response:
            response.read()
    except urllib_error.HTTPError as exc:
        print(
            f"AgentGuard network event upload failed with HTTP {exc.code}: {exc.reason}",
            file=sys.stderr,
        )
        print(exc.read().decode("utf-8", errors="replace"), file=sys.stderr)
    except Exception as exc:  # pragma: no cover
        print(f"AgentGuard network event upload failed: {exc}", file=sys.stderr)


class NetworkEventAddon:
    def response(self, flow):
        response = flow.response
        if response is None:
            return

        request = flow.request
        payload = {
            "hostname": request.host,
            "method": request.method,
            "url": request.url,
            "statusCode": response.status_code,
            "timestamp": _safe_iso_timestamp(),
        }

        _send_event(payload)


addons = [NetworkEventAddon()]
