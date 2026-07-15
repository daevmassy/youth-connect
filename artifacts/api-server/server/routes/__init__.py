from fastapi import APIRouter
from .health import router as health_router
from .auth import router as auth_router
from .devotionals import router as devotionals_router
from .reading_plans import router as reading_plans_router
from .prayers import router as prayers_router
from .events import router as events_router
from .chat import router as chat_router

router = APIRouter()
router.include_router(health_router)
router.include_router(auth_router)
router.include_router(devotionals_router)
router.include_router(reading_plans_router)
router.include_router(prayers_router)
router.include_router(events_router)
router.include_router(chat_router)
