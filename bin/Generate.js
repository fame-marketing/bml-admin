const fs = require('fs'),
      util = require('util'),
      path = require('path');


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

    this.writeSitemap(sitemap, url);
  }

  async writeSitemap(file,url) {
    const stream = fs.createWriteStream(file, {flags: "r+", mode:"0o644", emitClose: true}),
          lastmod = new Date(),
          newUrl = `<url>
                      <loc>${this.domain}/${url}</loc>
                      <lastmod>${lastmod}</lastmod>
                    </url>`;
    stream.write(newUrl);
  }

}

module.exports = Generate;