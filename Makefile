.PHONY: dev build preview typecheck deploy-pages deploy-worker release

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

typecheck:
	npm run typecheck

deploy-pages:
	npm run deploy:pages

deploy-worker:
	npm run deploy:worker

release:
	npm run release
