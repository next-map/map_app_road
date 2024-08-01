'use client'
import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { CustomOverlayMap, Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import './map.css'
import Roadmap from "./roadmap";
import axios from "axios";

// npm install react-kakao-maps-sdk
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=b4dbb01618c369d6fccddd1e90bb4dee&libraries=services,clusterer&autoload=false`;
const KAKAO_API_KEY = 'b4dbb01618c369d6fccddd1e90bb4dee'
const REST_API_KEY = '7ad5f2c57fe405b9a655856ec7ff4c9d'




export default function KakaoMap() {
  const [position, setPosition] = useState({
    // 초기 위치 설정: 인천 부평
    lat: 37.50802,
    lng: 126.72185
  });

  const [loaded, setLoaded] = useState(false);
  const [info, setInfo] = useState();
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermStart, setSearchTermStart] = useState("");
  const [searchTermEnd, setSearchTermEnd] = useState("");
  const [route, setRoute] = useState([]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [detailRoads, setDetailRoads] = useState([]);
  const [routeInfo, setRouteInfo] = useState();

  
  useEffect(()=> {
    if(!map || !window.kakao) return;
    
    const {kakao} = window;
    const ps = new kakao.maps.services.Places();
    
    
    if(searchTerm){
      ps.keywordSearch(searchTerm, (data, status, _pagination) =>  {
        if(status === kakao.maps.services.Status.OK) {
          const bounds = new kakao.maps.LatLngBounds()
          const newMarkers = data.map(item => ({
            position:{lat:parseFloat(item.y), lng:parseFloat(item.x)},
            content: item.place_name
          }));
          
          newMarkers.forEach(marker=> bounds.extend(new kakao.maps.LatLng(marker.position.lat, marker.position.lng)));
          setMarkers(prevMarkers => [...prevMarkers, ...newMarkers]);
          map.setBounds(bounds);
        }
      })
        }
  

      }, [map, searchTerm])

      
      useEffect(()=>{
        if (searchTermStart && searchTermEnd) {
          const ps = new window.kakao.maps.services.Places();
         
          
          setMarkers([]);
          ps.keywordSearch(searchTermStart, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
              const { y, x } = data[0];
              const start = { lat: parseFloat(y), lng: parseFloat(x) };
              setStartPosition(start);
              setMarkers(prevMarkers => [...prevMarkers, { position: start, content: '출발지' }]);
              
            }
          });
          ps.keywordSearch(searchTermEnd, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
              const { y, x } = data[0];
              const end = { lat: parseFloat(y), lng: parseFloat(x) };
              setEndPosition(end);
              setMarkers(prevMarkers => [...prevMarkers, { position: end, content: '도착지' }]);
             
            }
          });
        }
      },[searchTermStart, searchTermEnd, map])
      
      
      const calculateRoute = useCallback((startPosition, endPosition) => {
        if (!startPosition || !endPosition) return;
        const origin = encodeURIComponent(`${startPosition.lng},${startPosition.lat}`);
        const destination = encodeURIComponent(`${endPosition.lng},${endPosition.lat}`);
        
        axios.get(`https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}&waypoints=&priority=RECOMMEND`,
          {
            headers: {
              'Authorization': `KakaoAK ${REST_API_KEY}`,
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            console.log('response' ,response.data)
            const {sections, summary} = response.data.routes[0];
            if (sections.length > 0) {
              const {roads} = sections[0];
              console.log('Summary',summary)
              if(summary || roads){
              const newDetailRoads = roads.flatMap(road => {
                const vertices = road.vertexes;
                return vertices.reduce((acc, _, index) => {
                  if (index % 2 === 0 && index +1 < vertices.length ) {
                      acc.push({lat:vertices[index + 1], lng:vertices[index]})
                    }
                  
                    return acc;

                  }, []);
                  
                });
                setDetailRoads(newDetailRoads);
                setRouteInfo({
                  distance: summary.distance,
                  duration: summary.duration
                })
              }
              }
            })
            .catch(error => {
            console.error('경로 계산 오류:', error);
          });
        }, []);
       
        
        useEffect(()=>{
          if(startPosition && endPosition){
            calculateRoute(startPosition, endPosition);
          }
        },[startPosition, endPosition, calculateRoute]);
      
        useEffect(()=>{
          if(!map || detailRoads.length === 0) return;

          const bounds = new kakao.maps.LatLngBounds();
          detailRoads.forEach((point)=>{
            bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
          })
          map.setBounds(bounds);
        },[map, detailRoads])

      useEffect(()=>{
          console.log('detailRoads: ', detailRoads)
          console.log('routeInfo',routeInfo)
        },[detailRoads, routeInfo])

        useEffect(() => {
          const script = document.createElement('script');
          script.src = KAKAO_SDK_URL;
          document.head.appendChild(script);
          script.onload = () => setLoaded(true);
        }, []);
        
        

  const handleSearch = (startPos, endPos) =>{
    setSearchTermStart(startPos);
    setSearchTermEnd(endPos);
    setShowRoadmap(true);
  }
  
  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 현재 위치를 가져와서 상태 업데이트
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchTerm);
  }

  const handleShowRoadmap = ()=>{
    setShowRoadmap(true);
  }

  const getMidPoint = (points)=>{
    if(points.length === 0 ) return {lat:position.lat, lng: position.lng};
    const midIndex = Math.floor(points.length /2 );
    const offset = 0.001;


    return {
      lat : points[midIndex].lat + offset,
      lng : points[midIndex].lng + offset
    }
  }

  const midPoint = getMidPoint(detailRoads);
  

  return (
    <div>
      <div className="SearchBar">
        <button className="Search-button1" onClick={handleShowRoadmap}>길찾기</button>
        <form onSubmit={handleSearchSubmit}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="검색어를 입력하세요" className="Search-input"/>
          <button type="submit" className="Search-button">검색</button>
        </form>
        <button onClick={moveToCurrentLocation} className="my-current-location">	&#10146;</button>
      {showRoadmap && <Roadmap onSearch={handleSearch} onClose={()=>setShowRoadmap(false)}/>}
      </div>

      <div className="map-container">
      <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`} strategy="beforeInteractive" />
        {loaded && (
          <div className="map-wrapper">
            <Map center={position} className="map" level={5} draggable={true} onCreate={setMap}>
              {
                markers.map((marker,index)=>(
                  <MapMarker
                  key={`marker-${index}-${marker.position.lat},${marker.position.lng}`}
                  position={marker.position}
                  onClick={() => setInfo(marker)}
                  >
                    {info && info.content === marker.content && (
                      <div style={{color:"#000"}}>{marker.content}</div>
                    )}
                  </MapMarker>
                ))
              }
              {detailRoads.length > 0 && (
                <Polyline
                path={detailRoads} 
                strokeColor="red"
                strokeOpacity={0.8}
                strokeWeight={5}/>
              )}
              {routeInfo && detailRoads.length > 0 && (
                <CustomOverlayMap position={midPoint} xAnchor={0.5} yAnchor={1.5}>
                  <div className="route-info">
                    <span>거리 : {(routeInfo.distance / 1000).toFixed(2)} km</span><br/>
                    <span>시간 : {(routeInfo.duration / 60).toFixed(2)} 분</span>
                  </div>
                </CustomOverlayMap>
              )}
            </Map>
          </div>
        )}
      </div>
    </div>
  );
} 