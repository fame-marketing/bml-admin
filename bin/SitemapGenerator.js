import fs from 'fs'
import util from 'util'
import path from 'path'
import logger from "../bin/winston.js";

/*
 | @sitemap - should be a string representing the path relative to the web root
 | where the sitemap is located.
 |
 | This class will handle writing the new seo page url into the sitemap.
*/
export default class SitemapGenerator {

  constructor(sitemap, url) {
    logger.info('running sitemap generator');
    this.fs = fs;
    this.util = util;
    this.domain = process.env.URL;
    this.destination = process.env.NN_FILE_DESTINATION;
    this.url = url;

    this.getWriteLocation(sitemap);
  }

  /*
   |
   | @param file - the sitemap file.
   | This function handles finding the correct location in the sitemap to add the new url.
   | if the sitemap passed does not exist, it will be created and the new url will be added as the first url in the sitemap.
   */
  getWriteLocation(file) {

    const writeLoc = fs.readFile(file, (e, data) => {
      if (e) {
        if (e.code === 'ENOENT') {
          const sitemapBase = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">


  <!-- ::writeHere:: -->
  <!-- DO NOT REMOVE THESE COMMENTS -->
</urlset>`;
          fs.writeFile(file, sitemapBase, (e) => {
            if (e) throw e;
            const writePos = sitemapBase.indexOf('<!-- ::writeHere:: -->') - 1;
            this.writeSitemap(file,this.url,writePos);
          })
        } else {
          throw e;
        }
      } else {
        const writePos = data.indexOf('<!-- ::writeHere:: -->') - 1;
        this.writeSitemap(file,this.url,writePos);
      }
    });
  }

  /*
   |
   | @param file - the sitemap file.
   | @param url - the name of the new page to be added to the sitemap.
   | @param position - the position(index) within the sitemap where node will write the new url info to.
   | This function handles writing the new url to the sitemap. NOTE: Windows has trouble performing this action on a file that is located on a mounted drive.
   |
   */
  writeSitemap(file,url,position) {
    const getDateFormatted = new Date().toLocaleString('en-GB'),
      lastmod = getDateFormatted.substring(0, 10).split('/').reverse().join('-'),
      domainBase = this.removeTrailingSlash(this.domain),
      newUrl = `<url>
                        <loc>${domainBase}/${this.destination}/${url}</loc>
                        <lastmod>${lastmod}</lastmod>
                    </url>
                  <!-- ::writeHere:: -->
                  <!-- DO NOT REMOVE THESE COMMENTS -->
                </urlset>`;

    fs.open(file, 'r+', (e, fd) => {

      if (e) throw e;

      fs.write(fd, newUrl, position, (e,written,string) => {

        if (e) {
          logger.error('Could not write a new sitemap entry for the url ' + url + '. Make sure that the sitemap exists and is writeable. You will need to add the failed url manually.');
          throw e;
        }

        fs.close(fd, (e) => {
          if (e) throw e;
        })

      });

    });
  }

  removeTrailingSlash(path) {
    if (path.endsWith('/')) {
      path = path.slice(0,-1)
    }
    return path;
  }

}