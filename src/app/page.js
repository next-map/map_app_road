
import KakaoMap from "./map/map";
import MapPage from "./map/map";


export default function Home() {
  
  return (
    <div className="bg-1280px">
      <div className="navbar">
        <h1 className="next-map-title">Next 지도</h1>
      </div>
        <KakaoMap/>
    </div>
  );
}