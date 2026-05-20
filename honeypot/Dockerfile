FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim
RUN useradd -m -u 1001 honeytrap
WORKDIR /app
COPY --from=builder /root/.local /home/honeytrap/.local
COPY --chown=honeytrap:honeytrap . .
USER honeytrap
ENV PATH=/home/honeytrap/.local/bin:$PATH
EXPOSE 2222 8080
CMD ["python", "main.py"]
