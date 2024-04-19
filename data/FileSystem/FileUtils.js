import os from 'os'
import path from 'path'
import logger from "../../bin/winston.js";

export default class FileUtils {

  constructor() {

    this.os = os;
    this.path = path;
    this.dPath = this.fixSlashes(process.env.NN_FILE_DESTINATION);

  }

  getFileRoot() {
    return '/' + this.fixSlashes(this.os.homedir()) + '/public_html/' + this.dPath + '/';
  }

  fixSlashes(pathString) {
    logger.error(process.env.DB_HOST)
    if (pathString.endsWith('/')) {
      pathString = pathString.slice(0,-1)
    }
    if (pathString.startsWith('/')) {
      pathString = pathString.slice(1)
    }
    const backSlashRegex = /\\/g
    return pathString.replace(backSlashRegex, '/');
  }

  getExtensionName(fileString) {
    return path.extname(fileString)
  }

  getFileBasename(fileString) {
    const ext = this.getExtensionName(fileString);
    return path.basename(fileString, ext);
  }

  getFileBirthtime(fileString) {
    const fileFullLocation = this.getFileRoot() + fileString
    const {birthtime} = fs.statSync(fileFullLocation)
    return birthtime
  }

}