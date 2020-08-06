import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import fetch from "node-fetch";

const MediaUpload = () => {
	const [endpoint, setEndpoint] = useState(null);
	const [loading, setLoading] = useState(true);

	const onDrop = useCallback((acceptedFiles) => {
		// Do something with accepted files
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
	});

	useEffect(() => {
		fetch("/api/v1/endpoints/")
			.then((response) => response.json())
			.catch((error) =>
				console.error("Could not convert response to JSON", error)
			)
			.then((data) => {
				setEndpoint(data["media-endpoint"]);
			})
			.catch((error) => {
				// Do something with error
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	if (loading) <p>Preparing media form...</p>;

	return (
		<form
			action={endpoint}
			method="post"
			encType="multipart/form-data"
			className="form form--media media-form"
			id="media-form"
		>
			<fieldset>
				<legend>Media upload</legend>
				<label htmlFor="media-form__file-upload">Attach a file:</label>
				<div {...getRootProps()}>
					<input {...getInputProps()} />
					{isDragActive ? (
						<p className="form-field-group__description">
							Drop the files here...
						</p>
					) : (
						<p className="form-field-group__description">
							<strong>Caution: This does not work!</strong>You can simultaneously attach media and we will
							return a URL for you to use in your post. Drag 'n'
							drop some files here, or click to select files.
						</p>
					)}
				</div>
			</fieldset>
		</form>
	);
};

export default MediaUpload;
