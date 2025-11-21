import sys
from loguru import logger
from pathlib import Path

# Remove default handler
logger.remove()

# Create logs directory
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Add custom handlers
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
    colorize=True,
)

logger.add(
    logs_dir / "app.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="DEBUG",
    rotation="100 MB",
    retention="30 days",
    compression="zip",
)

logger.add(
    logs_dir / "error.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="ERROR",
    rotation="100 MB",
    retention="60 days",
    compression="zip",
)


def get_logger(name: str):
    """Get a logger instance for a specific module"""
    return logger.bind(name=name)
