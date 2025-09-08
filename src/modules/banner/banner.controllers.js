import { Banner } from './banner.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { deleteImage } from '../../utils/deleteUploads.js';

export const findAll = catchAsync(async (req, res, next) => {
  const banners = await Banner.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: banners.length,
    banners,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { url_banner } = req;

  return res.status(200).json({
    status: 'Success',
    url_banner,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const img_url = req?.file?.filename;

  const banner = await Banner.create({
    url_banner: img_url,
  });

  res.status(201).json({
    status: 'success',
    message: 'the banner has been created successfully!',
    banner,
  });
});

export const update = catchAsync(async (req, res) => {
  const { banner } = req;

  let updateData = {};
  if (req.file) {
    if (banner.url_banner) {
      await deleteImage(banner.url_banner);
    }
    updateData.url_banner = req.file.filename;
  }
  await banner.update(updateData);

  const updatedBanner = await banner.reload();

  return res.status(200).json({
    status: 'success',
    message: 'updatedBanner information has been updated',
    updatedBanner,
  });
});

export const deleteBanner = catchAsync(async (req, res) => {
  const { banner } = req;

  if (banner.url_banner) {
    const ress = await deleteImage(banner.url_banner);
    console.log(ress);
  }
  await banner.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The banner with id: ${banner.id} has been deleted`,
  });
});
