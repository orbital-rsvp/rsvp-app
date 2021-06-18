import React, { useState } from "react";
import NavigationBar from "../../NavigationBar/NavigationBar";
import { Carousel, Button } from "react-bootstrap";
import StepOne from "./img/StepOne.png";
import StepTwo from "./img/StepTwo.png";
import StepThree from "./img/StepThree.png";
import { Link } from "react-router-dom";
import "./CalGuide.css";

export default function CalGuide() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <>
      <NavigationBar />
      <div
        className="p-3 mb-2 bg-dark text-white"
        style={{ minHeight: "100vh" }}
      >
        <h2 className="text-center mb-5">Calendar How-To</h2>
        <Link to="/calendar">Back to Calendar</Link>

        <Carousel activeIndex={index} onSelect={handleSelect}>
          <Carousel.Item>
            <img className="d-block w-100" src={StepOne} alt="First slide" />
            <Carousel.Caption>
              <h3 className="mt-5">Step 1</h3>
              <p className="mt-5">Going to Google Calendar.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={StepTwo} alt="Second slide" />

            <Carousel.Caption>
              <h3 className="mt-5">Step 2</h3>
              <p className="mt-5">Getting public URL.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={StepThree} alt="Third slide" />

            <Carousel.Caption>
              <h3 className="mt-5">Step 3</h3>
              <p className="mt-5">
                Saving URL in RSVP+ for future logins to fetch from.
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>
    </>
  );
}