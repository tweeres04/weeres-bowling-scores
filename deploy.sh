ssh server -T <<'EOL'
	cd weeres-bowling-scores && \
	git fetch && git reset --hard origin/main && \
	docker compose up --build -d
EOL
