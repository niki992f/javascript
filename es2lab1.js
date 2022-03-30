"use strict"
const dayjs = require("dayjs");

const localizedFormat = require('dayjs/plugin/localizedFormat');
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
}

function main() {
    const f1 = new Film(1, "Pulp Fiction", true, "2022-03-10", 5);
    const f2 = new Film(2, "21 Grams", true, "2022-03-17", 4);
    const f3 = new Film(3, "Star Wars", false);
    const f4 = new Film(4, "Matrix", false);
    const f5 = new Film(5, "Shrek", false, "2022-03-21", 3);

    const library = new FilmLibrary();
    library.addNewFilm(f1);
    library.addNewFilm(f2);
    library.addNewFilm(f3);
    library.addNewFilm(f4);
    library.addNewFilm(f5);

    console.log("**** List of film sorted by date ****");
    const sorted_films = library.sortByDate();
    sorted_films.forEach((Film) => console.log(Film.toString()));

    library.deleteFilm(3);
    
    library.resetWatchedFilm();

    library.print();

    console.log("**** film filtered, rated one ****");
    const rated_film = library.getRated();
    rated_film.forEach(film => console.log(film.toString()));
}

main();