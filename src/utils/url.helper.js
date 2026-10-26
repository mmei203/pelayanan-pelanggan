export const formatFileUrl = (req, filePath) => {
	if (!filePath) return null;
	if (filePath.startsWith("http")) return filePath;

	const normalizedPath = filePath.replace(/\\/g, "/");
	return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
};
