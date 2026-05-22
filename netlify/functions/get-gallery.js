const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async () => {

    try {

        const result = await cloudinary.search
            .expression('resource_type:image AND folder:AFG-Church-Gallery')
            .sort_by("created_at", "desc")
            .max_results(20)
            .execute();

        const images = result.resources.map(img => ({
            url: img.secure_url,
            created_at: img.created_at
        }));

        return {
            statusCode: 200,
            headers: {
                "Cache-Control": "no-cache",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify(images)
        };

    } catch (err) {

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: err.message
            })
        };

    }

}