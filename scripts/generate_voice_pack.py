import asyncio
import json
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
JOBS_FILE = ROOT / "public" / "audio" / "voice-jobs.json"
CONCURRENCY = 4


async def generate(job: dict[str, str], semaphore: asyncio.Semaphore) -> None:
    target = ROOT / "public" / "audio" / job["path"]
    if target.exists() and target.stat().st_size > 1000:
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    async with semaphore:
        last_error: Exception | None = None
        for attempt in range(4):
            try:
                communicate = edge_tts.Communicate(
                    job["text"],
                    job["voice"],
                    rate=job["rate"],
                    pitch=job["pitch"],
                )
                await communicate.save(str(target))
                print(f"voice {job['path']}")
                return
            except Exception as error:
                last_error = error
                await asyncio.sleep(1.5 * (attempt + 1))
        raise RuntimeError(f"Failed voice job {job['path']}: {last_error}")


async def main() -> None:
    payload = json.loads(JOBS_FILE.read_text(encoding="utf-8"))
    semaphore = asyncio.Semaphore(CONCURRENCY)
    await asyncio.gather(
        *(generate(job, semaphore) for job in payload["jobs"])
    )
    print(f"Voice pack ready: {len(payload['jobs'])} files")


if __name__ == "__main__":
    asyncio.run(main())
