const request = require('request');
const cheerio = require('cheerio');


let source_code;
function gotoPage(webpage_url){
    return new Promise((resolve, reject) => {
        request.get({headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'}, url:webpage_url, method: 'GET'}, function(error, response, html){
            if(!error && response.statusCode === 200){
                source_code = html;
                resolve();
            }else {
                reject(console.log('An Error Occurred!'))
            }
        })
    })
}


//Run the scrape data function and pass in the url address and 
//Automatically the source_code variable will the change it's previous value to a new value
//which is the new source code.

class seriesDataScrapper{
    constructor(url){
        this.url = url;
        this.$;
        this.data = {};
        this.temp_data = {};
        this.series;
        this.season;
        this.season_list_link = [];
        this.season_name;
        //Season_number works in hand with season_text name
        this.season_number = 0;
        this.season_text_name = [];
        this.episode;
        this.episode_list_link = [];
        this.pagination = [];
    }

    phase_1(){
        this.series['series name'] = this.$('.tv_series_info .serial_name').text();
        this.series['series image'] = this.$('.tv_series_info .img img').attr('src');
        this.series['series description'] = this.$('.tv_series_info .serial_desc').text();
        this.series['series more info'] = this.$('.tv_series_info .season_name a').attr('href');
        this.series['series seasons'] = {};
        this.$('.data_list .data').each((index, element) => {
            let link = Array.from(this.$(element).children('a').attr('href'));
            if(link.includes("?")){
                link = link.slice(0, link.indexOf('?'))
            }
            this.season = this.series['series seasons'][this.$(element).children('a').text()] = (link).join('');
            this.season_list_link.push(this.season);
            this.season_text_name.push(this.$(element).children('a').text());
        });
        this.season_loop();
    }

    async season_loop(){
        for(this.season of this.season_list_link){
            await gotoPage(this.season);
            this.$ = cheerio.load(source_code);
            await this.phase_2();
            this.data[this.$('.tv_series_info .serial_name').text()][this.season_text_name[this.season_number]] = {...this.season_name};
            console.log(`${this.season_text_name[this.season_number]} successfully loaded all episodes`);
            this.season_number++;
            break;
        }
        console.log(this.data);
    }

    async episode_loop(){
        for(this.episode of this.episode_list_link){

        }
    }

    async phase_2(){
        this.season_name = this.series[this.$('.tv_series_info .season_name').text()] = {};
        this.$('.data_list .data').each((index, element) => {
            let link = Array.from(this.$(element).children('a').attr('href'));
            if(link.includes("?")){
                link = link.slice(0, link.indexOf('?'))
            }
            this.episode = this.season_name[this.$(element).children('a').text()] = (link).join('');
            this.episode_list_link.push(this.episode);
            });
        if(this.$('.pagination a').length >= 1){
            this.$('.pagination a').each((index, element) => {
                this.pagination.push(this.$(element).attr('href'));
            })
            
            for(let i = 0; i < this.pagination.length; i++){
                let other_page = await this.phase_2__further_link();
                this.season_name = {...this.season_name, ...other_page};
            }
        }
    }

    async phase_2__further_link(){
        for(let further_page of this.pagination){
            await gotoPage(further_page);
            this.$ = cheerio.load(source_code);
            this.$('.data_list .data').each((index, element) => {
                let link = Array.from(this.$(element).children('a').attr('href'));
                if(link.includes("?")){
                    link = link.slice(0, link.indexOf('?'))
                }
                this.temp_data[this.$(element).children('a').text()] = (link).join('');
            });
        }
        return this.temp_data;
    }

    scrape(){
        this.$ = cheerio.load(source_code);
        if(this.series == null){
            this.series = this.data[this.$('.tv_series_info .serial_name').text()] = {};
        }
        this.phase_1()
    }

    async run(){
        await gotoPage(this.url);
        console.log('Program has successfully started!')
        this.scrape();
    }
}



let url = 'https://tvshows4mobile.com/The-Flash-9/';
const program = new seriesDataScrapper(url);
program.run();