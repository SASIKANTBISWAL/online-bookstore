import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Book } from 'src/app/common/book';
import { BookService } from 'src/app/services/book.service';

import {NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-book-list',
  //templateUrl: './book-list.component.html',
  templateUrl: './book-grid.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  books: Book[] = [];
  currenCategoryId: number = 1;
  searchMode: boolean = false;
  previousCategory: number = 1;
  
  //new properties for server side paging.
  currentPage: number = 1;
  pageSize:  number = 5;
  totalRecords: number = 0;


  constructor(private _bookService: BookService,
              private _activatedRoute: ActivatedRoute,
              _config: NgbPaginationConfig) {
                _config.maxSize = 3;
                _config.boundaryLinks = true;
               }

  ngOnInit() {
    this._activatedRoute.paramMap.subscribe(() => {
      this.listBooks();
    })
  }

  

  listBooks() {
    this.searchMode = this._activatedRoute.snapshot.paramMap.has('keyword');

    if(this.searchMode) {
      // do the search work
      this.handleSearchBooks();
    } else {
      // display books based on category
      this.handleListBooks();
    }
  }

  handleListBooks() {
    const hasCategoryId: boolean = this._activatedRoute.snapshot.paramMap.has('id');
    
    if(hasCategoryId){
      this.currenCategoryId = +this._activatedRoute.snapshot.paramMap.get('id');
    } else {
      this.currenCategoryId = 1;
    }

    //setting up the page number to 1
    // if the user navigates to other category
    if(this.previousCategory != this.currenCategoryId) {
      this.currentPage = 1;
    }

    this.previousCategory = this.currenCategoryId;

    this._bookService.getBooks(this.currenCategoryId,
                               this.currentPage - 1,
                               this.pageSize)
                               .subscribe(
                                  this.processPaginate());
  }

  handleSearchBooks() {
    const keyword: string = this._activatedRoute.snapshot.paramMap.get('keyword');

    this._bookService.searchBooks(keyword,
                                  this.currentPage - 1,
                                  this.pageSize).subscribe(this.processPaginate());
  }

  updatePageSize(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.listBooks();
  }

  processPaginate() {
    return data => {
      this.books = data._embedded.books;
      //page number starts from 1 index
      this.currentPage = data.page.number + 1;
      this.totalRecords = data.page.totalElements;
      this.pageSize = data.page.size;
    }
  }

}