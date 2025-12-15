"use client";
import { useEffect, useState } from "react";
import Container from "../container";
import Categories from "./Catagories";
import Deals from "./Deals";
import Footer from "./Footer";
import Header from "./Header";
import HomeBanner from "./HomeBanner";
import LatestProducts from "./LatestProducts";
import PopularProducts from "./PopularProducts";
import SaleBanner from "./SaleBanner";
import TopNavBar from "./search/TopNavBar";
import Services from "./Services";
import FeaturedCategories from "./FeaturedCategories";
import { TestimonialCards } from "./Testimonials";

function Homepage() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  ); // 'up' or 'down'

  useEffect(() => {
    let lastScrollTop = window.scrollY;

    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Set scrolled state
      setScrolled(scrollTop > 100);

      // Set scroll direction
      if (scrollTop > lastScrollTop) {
        setScrollDirection("down");
      } else if (scrollTop < lastScrollTop) {
        setScrollDirection("up");
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Prevent negative value
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Container className="fixed  w-full z-50 transition-all duration-1000 bg-red-900" >
        {/* {!scrolled && (
          <div className="bg-white shadow">
            <TopNavBar />
          </div>
        )} */}
        <div
          className={`bg-white transition-all duration-300 ${
            scrolled ? "fixed top-0 w-full" : ""
          } ${scrollDirection === "down" ? "pt-2 sm:pt-0" : "pt-0"}`}
        >
          <Header />
        </div>
      </Container>

      <div className={scrolled ? "h-20" : "sm:h- h-24"} />
      <HomeBanner />
      <FeaturedCategories />
      {/* <HomePageCarousel/> */}
      {/* <HomeCommingSoon /> */}
      {/* <CategoriesHome /> */}
      {/* <ProductZoom /> */}
      {/* <SpecialOffers /> */}
      <Deals />
      <LatestProducts />
      <PopularProducts />
      <SaleBanner />
      <Categories />
      <TestimonialCards />
      <Services />
      <Footer />
    </>
  );
}

export default Homepage;
