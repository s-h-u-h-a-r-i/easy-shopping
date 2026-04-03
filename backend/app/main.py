from fastapi import FastAPI

app = FastAPI(
    title="Easy Shopping API",
    description="Backend API for the Easy Shopping app. Manages shopping lists and AI-powered suggestions.",
    version="0.1.0",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", reload=True)
