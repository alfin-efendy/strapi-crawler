/**
 * storage service
 */

import utils from '@strapi/utils';
import axios from 'axios';
import * as fse from 'fs-extra';
import * as stream from "stream";
import * as os from 'os';
import * as path from 'path';
import mime from 'mime-types';

const { ApplicationError } = utils.errors;

const getServiceUpload = (name) => {
  return strapi.plugin("upload").service(name);
};


export default () => ({
  async createFolder(parentFolder: string, folderName: string) {
    try {
      const fileData = {
        name: folderName,
        type: 'folder',
        path: parentFolder ? `${parentFolder}/${folderName}` : folderName,
      };

      // Assuming you need to create a folder directly
      const uploadedFolder = await strapi.plugins['upload'].services.upload.upload({
        data: fileData,
        files: [],
      });

      return uploadedFolder;
    } catch (error) {
      throw new ApplicationError(error.message, {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  },

  async uploadFromUrl(parentFolder: string, folderName: string, url: string, fileName: string) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      
      const contentType = response.headers['content-type'];
      const extension = mime.extension(contentType);

      const uploadService = strapi.service("plugin::upload.provider");
      const config = strapi.config.get("plugin::upload.provider");
      const folder = await strapi.service('plugin::upload.api-upload-folder').getAPIUploadFolder()
     
      // add generated document
      const entity = {
        name: fileName,
        hash: `${fileName}-${Date.now()}`,
        ext: `.${extension}`,
        mime: contentType,
        size: buffer.length,
        provider: config,
        folder: folder.id,
        folderPath: folder.path,
        getStream: () => stream.Readable.from(buffer),
      };

      await uploadService.upload(entity);

      const result = await strapi.query('plugin::upload.file')
      .create({ data: entity });

      return result;
    } catch (error) {
      console.log('error', error);
      throw new ApplicationError(error.message, {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  },
});
