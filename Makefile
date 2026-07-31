.PHONY: up down

up:
	docker compose -f docker-compose/postgres/compose.yml -f docker-compose.override.yml --env-file docker-compose/postgres/.env up -d

down:
	docker compose -f docker-compose/postgres/compose.yml -f docker-compose.override.yml --env-file docker-compose/postgres/.env down