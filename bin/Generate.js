const fs = require('fs'),
      util = require('util'),
      path = require('path'),
      winston = require('./winston');

/*
 | @sitemap - should be a string representing the path relative to the web root
 | where the sitemap is located.
 |
 | This class will handle writing the new seo page url into the sitemap.
*/
class Generate {

  constructor(sitemap, url) {
    this.fs = fs;
    this.util = util;
    this.domain = process.env.URL;
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

    const writePos = data.indexOf('<!-- ::writeHere:: -->') - 1;

    const writeLoc = fs.readFile(file, (e, data) => {
      if (e) {
        if (e.code === 'ENOENT') {
          const sitemapBase = ``;
          fs.writeFile(file, sitemapBase, (e) => {
            if (e) throw e;
            this.writeSitemap(file,this.url,writePos);
          })
        } else {
          throw e;
        }
      } else {
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
    const lastmod = new Date(),
          newUrl = `<url>
                      <loc>${this.domain}/${url}</loc>
                      <lastmod>${lastmod}</lastmod>
                    </url>\n`;

    fs.open(file, (e, fd) => {

      if (e) throw e;

      fs.write(fd, newUrl, position, (e,written,string) => {

        if (e) {
          winston.error('Could not write a new sitemap entry for the url ' + url + '. Make sure that the sitemap exists and is writeable. You will need to add the failed url manually.');
          throw e;
        }
        winston.info('wrote new url to sitemap.xml');

      });

    });
  }

}

module.exports = Generate;
