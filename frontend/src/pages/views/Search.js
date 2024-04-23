import React, { useState } from 'react';
import { Button } from "reactstrap";


const SearchPage = () => {
    return (
        <>
            <div className="card card-bordered">    
                <div className="row">
                    <div className="col-md-3">
                        <img src="https://pic.arkread.com/cover/column/f/65523613.1698030480.jpg" className="card-img-left w-100 h-auto" alt="" />
                    </div>
                    <div className="col-md-8">
                        <div className="card-inner">        
                            <h4 className="card-title">Book Title</h4>
                            <h5 className="card-subtitle mb-2 text-muted">SubTitle</h5>  
                            <h6 className="card-subtitle mb-2 text-muted">Author</h6>      
                            <p className="card-text">Abstract</p>        
                            <a href="https://read.douban.com/ebook/30541512" className="btn btn-info">Details</a>
                            &nbsp;&nbsp;
                            <a href="#" className="btn btn-light">Import to the File</a>    
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
}

const Search = () => {
    
    return (
        <>
            <SearchPage /> 
        </>
    )
}

export default Search