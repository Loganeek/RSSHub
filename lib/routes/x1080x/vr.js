const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    var arr = new Array(1,2);
    var list = new Array();
    var link = new String();
    for(page in arr){
        link = `https://c700.me/forum.php?mod=forumdisplay&fid=163&forumdefstyle=yes&page=${page}`;
        const response = await got.get(link);
    
        const $ = cheerio.load(response.data);
        list = list.concat($('#waterfall li').slice(3).get());

    }

    const res = await Promise.all(
        list.map(async (item) => {
            let $ = cheerio.load(item);
    
            let title = $('a').attr('title');
            let item_link = $('a').attr('href');
            let pubDate =  new Date($('div.auth em').eq(1).text().trim()).toUTCString();
            
            const description = await ctx.cache.tryGet(item_link, async () => {
                const result = await got.get(item_link);
                $ = cheerio.load(result.data);
                return $('td.t_f').html();
            });
    
            const rssitem = {
                title,
                link: item_link,
                pubDate,
                description,
            };
            return Promise.resolve(rssitem);
        })
    );
    

    ctx.state.data = {
        title: 'VR',
        link: link,
        item: res,
    };

    
};
