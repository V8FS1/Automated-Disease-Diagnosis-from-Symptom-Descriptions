from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from chat.models import Conversation, Message
from django.utils.translation import (
    gettext_lazy as _,
)
admin.site.register(Conversation)
admin.site.register(Message)
