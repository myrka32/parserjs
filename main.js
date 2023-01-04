import cheerio  from 'cheerio';
import request from 'request-promise';
import fs from 'fs';
const page = 1;
let result;
let pagenumber = 38 // сколько страниц нужно пробежать. ЕСЛИ ПОСТАВИТЬ НЕПРАВИЛЬНОЕ ЧИСЛО, ВЫБЬЕТ ОШИБКУ.
let linksarr = []; // Создаем массив, куда мы будем добавлять ссылки.
let images = []; // Cоздаем массив, куда мы будем добавлять фотографии товара.
let options = []; // Создаем массив, куда мы будем добавлять параметры товара(размер)
const timer = ms => new Promise(res => setTimeout(res, ms)) // Создаем таймер. В итоговой версии, все функции вынести в файл function.js
console.log(`Начинаем обход страниц и добавление полученных ссылок в массив.`)
for(let i = 1; i < pagenumber; i++)      // Проходимся по всем страницам сайта.
{
request(`https://www.bike-discount.de/en/fahrrad?p=${i}&o=14&n=48`)  // указываем что парсить
.then(async function(html){
      const $ = cheerio.load(html);
      let links = $('[class="product--title"]');             // Получаем html страницы, загружаем в обработчик, получаем ссылки и добавляем в массив.
      for (let i = 0; i < links.length; i++) {
        linksarr.push(links[i].attribs.href)

      //  fs.appendFile('links.txt', links[i].attribs.href, function (err) {
      //   if (err) throw err;                              // debug
      //   console.log('Saved!');
      // });
      }
     
    })
    .catch(function(err){
      console.log(err);
    });
  } 
  await timer(20000); // Создаем таймер, чтобы дождаться окончания цикла, иначе функция вызовится раньше времени и мы получим ошибку.
  creationobject()
  async function creationobject() {        // Создаем обьект, который потом будем сохранять в JSON файл
   console.log("Начинаем cоздавать json файл с обьектом")
   let cleararr = [...new Set(linksarr)];
   for(let i = 0; i < cleararr.length; i++)
   {

  request(`${linksarr[i]}`)  // Из массива достаем ссылку, по которой надо перейти для получения информации :))
  .then(async function(html){
        const $ = cheerio.load(html);
      //  console.log($.html())
      //   fs.appendFile('links.html', $.html(), function (err) {
      //    if (err) throw err;                              // debug
      //    console.log('Saved!');
      //  });
                   // Получаем html страницы, загружаем в обработчик, получаем ссылки и добавляем в массив.
        if(fs.existsSync("response.json") != true) {
          console.log("Файла не существует, поэтому он будет создан.")
          fs.open('response.json', 'w', (err) => {
            if(err) throw err;
            console.log('Файл успешно был создан!');
           });
        }
          $('div[class="image-slider--slide"]').children().map((key, value) => {
              let image = {
                large: $($(value).find('.image--element')[0]).data('img-large'),
                small: $($(value).find('.image--element')[0]).data('img-small'),
                original: $($(value).find('.image--element')[0]).data('img-original'),
              };
            images.push(image);
          });
          if($('div[class = "variant--option"]') != undefined)
          {
            $('div[class = "variant--option"]').each(function( index ) {
              let opt = {
                title: $( this ).text().split(' ').join('')
              }
              options.push(opt)
              console.log(opt)
              });
          }
          else {
            let opt = {
              title: ""
            }
            options.push(opt)
          }

       await timer(6000);
       console.log("Добавляем в обьект " + cleararr[i])
       let executor = $('h1[itemprop="name"]').parent().find("strong").text();
       let big = $('span[class="image--media"]').parent().find("srcset").text();
       let obj = [{
         title: $('h1[itemprop="name"]').text(),
         description: $('[class="product--description"]').html().replace(/<(.|\n)*?>/g, ''),
         price: $('span[id="netz-price"]').html(),
         manufacturer: [{
          title: executor,
          logo: $(`img[alt = "${executor}"]`).attr('src')
         }],
         images: images,
         feature: [{
          Rahmen: $('[class="product--properties-value"]').text(),
          Rahmenmaterial:$('[class="product--properties-value"]').text()
         }],
         options: options 
       }]
       fs.appendFileSync('response.json', JSON.stringify(obj)); 
      
      })
      .catch(function(err){
        console.log(err);
      });
      await timer(12000);
    }
    }
