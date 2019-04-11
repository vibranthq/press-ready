build:
	docker build -t vibranthq/press-ready cli

publish: build
	docker push vibranthq/press-ready

test: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		--input ./cli/test/fixture/review.pdf --output ./output.pdf

test-chrome: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		--input ./cli/test/fixture/chrome.pdf \
		--output ./output.pdf \
		--no-enforce-outline

run: build
	docker run --rm -it -v ${CURDIR}:/workdir --entrypoint bash vibranthq/press-ready