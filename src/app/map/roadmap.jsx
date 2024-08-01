'use client'
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk';
import './roadmap.css'
import { useEffect, useState } from 'react'
import Script from 'next/script';



export default function Roadmap({onSearch, onClose}){

    const [searchTermStart, setSearchTermStart] = useState("");
    const [searchTermEnd, setSearchTermEnd] = useState("");

    const handleSearchStart = (e)=> {
        setSearchTermStart(e.target.value)
    }
    const handleSearchEnd = (e)=> {
        setSearchTermEnd(e.target.value)
    }
    const handleFindRoute= ()=>{
        onSearch(searchTermStart, searchTermEnd)
    }

    const handleClose =()=>{
        onClose();
    }
    

    return(
        <div className="roadmap-container">
            <div className="roadmap-header">
                <input
                type="text"
                value={searchTermStart}
                onChange={handleSearchStart}
                placeholder="출발지를 입력하세요"
                />
                <input
                type="text"
                value={searchTermEnd}
                onChange={handleSearchEnd}
                placeholder="도착지를 입력하세요"
                />
            </div>
            <div className='roadmap-btn'>
            <button onClick={handleFindRoute} className='btn'>길찾기</button>
            <button className="close-btn" onClick={handleClose}>×</button>
            </div>
    </div>
    )
}