build:
	docker build -t vibranthq/press-ready .

test: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		build \
		--input ./test/fixture/review.pdf --output ./output.pdf

test-chrome: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		build \
		--input ./test/fixture/chrome.pdf \
		--output ./output.pdf \
		--no-enforce-outline

test-gray: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		build \
		--input ./test/fixture/chrome.pdf \
		--output ./output.pdf \
		--gray-scale

test-lint: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		-e DEBUG=* \
		vibranthq/press-ready \
		lint ./test/fixture/review.pdf

run: build
	docker run --rm -it -v ${CURDIR}:/workdir --entrypoint bash vibranthq/press-ready

clean:
	docker rmi vibranthq/press-ready