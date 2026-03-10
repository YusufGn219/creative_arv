"""
ASGI config for config project.

WebSocket routing intentionally disabled — will be activated in v5 (Messaging).
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    # 'websocket': ... → v5'te eklenecek
})