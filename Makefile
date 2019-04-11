build:
	docker build -t vibranthq/press-ready cli

publish: build
	docker push vibranthq/press-ready

test: build
	docker run --rm -it \
		-v ${CURDIR}:/workdir \
		vibranthq/press-ready \
		--input ./cli/test/fixture/input.pdf --output ./output.pdf