build:
	docker build -t vibranthq/press-ready app

publish: build
	docker push vibranthq/press-ready

test: build
	docker run --rm -it -v ${CURDIR}/test:/workdir vibranthq/press-ready ./input.pdf ./output.pdf