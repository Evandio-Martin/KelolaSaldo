from rest_framework import serializers


class MessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'assistant', 'system'])
    content = serializers.CharField(allow_null=True, allow_blank=True)
    reasoning_details = serializers.ListField(required=False, allow_null=True)


class ChatRequestSerializer(serializers.Serializer):
    messages = MessageSerializer(many=True)
    model = serializers.CharField(
        required=False,
        default='openai/gpt-oss-120b:free',
    )
    reasoning = serializers.BooleanField(required=False, default=False)
