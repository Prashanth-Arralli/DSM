const imageModel = require(MODELS + 'mock_images');

const add = async(req, res, next) => {
    try {
        let image = await new imageModel(req.body).save();
        return res.sendResponse({
            image
        }, 'Image has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
};

const query = async(req, res, next) => {
    try {
        let images = await imageModel.find().sort('-created_at');

        return res.sendResponse({
            images
        }, 'Images have been fetched successfully.');

    } catch (ex) {
        return next(ex);
    }

}

const remove = async(req, res, next) => {
    let _id = req.params.id;
    try {
        let image = await imageModel.remove({
            _id
        });
        return res.sendResponse({
            image
        }, 'Image has been removed successfully.');
    } catch (ex) {
        return next(ex);
    }

    // req.body.status = false;

    // try {
    //     let image = await imageModel.findOneAndUpdate({
    //             _id
    //         },
    //         req.body, {
    //             new: true
    //         });
    //     image = image.toObject();
    //     return res.sendResponse({
    //         image
    //     }, 'Image has been deleted successfully.');
    // } catch (ex) {
    //     return next(ex);
    // }
}

module.exports = {
    add,
    query,
    remove
}