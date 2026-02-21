.PHONY: release deploy-luscombefarm

release:
	./scripts/release.sh

deploy-luscombefarm:
	npm --prefix pages/luscombefarm run deploy
