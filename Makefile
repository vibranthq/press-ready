build:
	docker build -t vibranthq/press-ready .

publish: build
	docker push vibranthq/press-ready

lint: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		lint --input ./test/fixture/review.pdf

test: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		--input ./test/fixture/review.pdf --output ./output.pdf

test-chrome: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		--input ./test/fixture/chrome.pdf \
		--output ./output.pdf \
		--no-enforce-outline

test-gray: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		--input ./test/fixture/chrome.pdf \
		--output ./output.pdf \
		--gray-scale

run: build
	docker run --rm -it -v ${CURDIR}:/workdir --entrypoint bash vibranthq/press-ready