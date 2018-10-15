build:
	docker build -t vibranthq/core .

publish: build
	docker push vibranthq/core
