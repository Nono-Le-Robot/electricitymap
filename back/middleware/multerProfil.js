const multerProfil = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
};

const storage = multerProfil.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images/profil');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, Date.now() + name);
  }
});

module.exports = multerProfil({storage: storage}).single('file');