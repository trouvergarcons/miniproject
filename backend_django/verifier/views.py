from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def verify(request):
    content = request.data.get("content")

    return Response({
        "verdict": "REFERENCE_ONLY",
        "confidence": 0.5,
        "summary": f"You sent: {content}"
    })