build:
	docker build -t vibranthq/pdfx .

publish: build
	docker push vibranthq/pdfx

test: build
	