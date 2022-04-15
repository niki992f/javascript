"use strict"
const dayjs = require("dayjs");
const sqlite = require("sqlite3");

const localizedFormat = require('dayjs/plugin/localizedFormat');
const sqlite3 = require("sqlite3");
dayjs.extend(localizedFormat);

function Film(id, title, isFavourite = false, watchDate = '', rating = 0){
    this.id=id;
    this.title=title;
    this.Favourite=isFavourite;
    this.rating=rating;
    this.watchDate=watchDate && dayjs(watchDate);

    this.toString = () => {
        return `ID: ${this.id}, Title: ${this.title}, Favourite: ${this.favourite}, ` + 
        `score: ${this._formatRating()}, watchDate: ${this._formatWatchDate('LL')}`;
    }

    this._formatWatchDate = (format) => {
        return this.watchDate ? this.watchDate.format(format) : '<not defined>';
    }

    this._formatRating = () => {
        return this.rating ? this.rating : '<not assigned>'; 
    }
}

function FilmLibrary() {
    this.list = [];
    const db = new sqlite.Database('films.db', (err, rows) => {if(err) throw err});

    this.addNewFilm = (film) => {
        if(!this.list.some(f => f.id == film.id))
            this.list.push(film);
        else
            throw new Error('duplicated id');
    };

    this.print = () => {
        console.log("****** LIST OF FILM ******");
        this.list.forEach((film) => console.log(film.toString()));
    }

    this.sortByDate = () => {
        const new_array = [...this.list];
        new_array.sort((f1, f2) => {
            if(f1.watchDate === f2.watchDate)
                return 0;
            else if(f1.watchDate === null || f1.watchDate === '')
                return 1;
            else if(f2.watchDate === null || f2.watchDate === '')
                return -1;
            else
                return f1.watchDate.diff(f2.watchDate);
        });
    return new_array;
    }

    this.deleteFilm = (id) => {
        const new_list = this.list.filter(function(film, index, arr) {
            return film.id !== id;
        })
        this.list = new_list;
    }

    this.resetWatchedFilm = () => {
        this.list.forEach((film) => film.watchDate='');
    }

    this.getRated = () => {
        const new_list = this.list.filter(function(film, index, arr) {
            return film.rating > 0;
        })
        return new_list;
    }

    this.getAll = () => {
        return new Promise((resolver, reject) => {
            const query = 'SELECT * FROM films';
            db.all(query, [], (err, rows) => {
                if(err){
                    reject(err);
                }else{
                    const films = rows.map(record => new Film(record.id, record.title, record.favourite==1, record.watchDate, record.rating));
                    resolver(films);
                }
            });
        });
    };

    this.getFavorites = () => {
        return new Promise((resolver, reject) => {
            const query = 'SELECT * FROM films WHERE favorite = True';
            db.all(query, [], (err, rows) => {
                if(err){
                    reject(err);
                }else{
                    const films = rows.map(record => new Film(record.id, record.title, record.favourite==1, record.watchDate, record.rating));
                    resolver(films);
                }
            });
        });
    };

    this.getToday = () => {
        return new Promise((resolver, reject) => {
            const query = 'SELECT * FROM films WHERE watchdate = ?';
            const today = dayjs().format('YYYY-MM-DD');
            db.all(query, [today], (err, rows) => {
                if(err){
                    reject(err);
                }else{
                    const films = rows.map(record => new Film(record.id, record.title, record.favourite == 1, record.watchDate, record.rating));
                    resolver(films);
                }
            });
        });
    };

    this.getBeforeDate = () => {
        return new Promise((resolver, reject) => {
            const query = 'SELECT * FROM films WHERE watchdate < ?';
            db.all(query, [dayjs().format('YYYY-MM-DD')], (err, rows) => {
                if(err){
                    reject(err)
                }else{
                    const films = rows.map(record => new Film(record.id, record.title, record.favourite == 1, record.watchDate, record.rating));
                    resolver(films);
                }
            });
        });
    };

    this.getRated = (rating) => {
        return new Promise((resolver, reject) => {
            const query = 'SELECT * FROM films WHERE rating >= ?';
            db.all(query, [rating], (err, rows) => {
                if(err){
                    reject(err);
                }else{
                    const films = rows.map(record => new Film(record.id, record.title, record.favourite == 1, record.watchDate, record.rating));
                    resolver(films);
                }
            });
        });
    };

    this.getWithWord = (word) => {
        return new Promise((resolver, reject) => {
            const query = 'SELECT * FROM films WHERE title LIKE ?';
            db.all(query, ["%" + word + "%"], (err, rows) => {
                if(err){
                    reject(err)
                }else{
                    const films = rows.map(record => new Film(record.id, record.title, record.favourite == 1, record.watchDate, record.rating));
                    resolver(films);
                }
            });
        });
    };
}

async function main() {

    const filmLibrary = new FilmLibrary();
    
    try {
      // get all the movies
      console.log('\n****** All the movies in the database: ******');
      const films = await filmLibrary.getAll();
      if(films.length === 0)
        console.log('No movies yet, try later.');
      else
        films.forEach( (film) => console.log(`${film}`) );
  
      // get all favorite movies
      console.log('\n****** All favorite movies in the database: ******');
      const favoriteFilms = await filmLibrary.getFavorites();
      if(favoriteFilms.length === 0)
        console.log('No favorite movies yet, try later.');
      else
        favoriteFilms.forEach( (film) => console.log(`${film}`) );
  
      // retrieving movies watched today
      console.log('\n****** Movies watched today ******');
      const watchedToday = await filmLibrary.getToday();
      if(watchedToday.length === 0)
        console.log('No movies watched today, time to watch one?');
      else
        watchedToday.forEach( (film) => console.log(`${film}`) );
  
      // get films before a certain date
      const watchdate = dayjs('2022-03-19');
      console.log('\n****** Movies watched before ' + watchdate.format('YYYY-MM-DD') + ': ******');
      const watchedFilms = await filmLibrary.getBeforeDate(watchdate);
      if(watchedFilms.length === 0)
        console.log("No movies in this period, sorry.");
      else
        watchedFilms.forEach( (film) => console.log(`${film}`) );
  
      // get movies with a minimum score of 4
      const rating = 4
      console.log('\n****** Movies with a minimum rate of ' + rating + ': ******');
      const ratedFilms = await filmLibrary.getRated(rating);
      if(ratedFilms.length === 0)
        console.log('No movies with this rating, yet.');
      else
        ratedFilms.forEach( (film) => console.log(`${film}`) );
  
      // get films with a the word "war" in the title
      const word = 'war';
      console.log(`\n****** Movies containing '${word}' in the title: ******`);
      const filteredFilms = await filmLibrary.getWithWord(word);
      if(filteredFilms.length === 0)
        console.log(`No movies with the word ${word} in the title...`);
      else
        filteredFilms.forEach( (film) => console.log(`${film}`) );
    } catch (error) {
      console.log('Impossible to retrieve movies! Error:');
      console.error(error);
      return;
    }
  }

main();