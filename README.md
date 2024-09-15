<p align="center">
  <img src="./assets/images/Flight Viewer Logo.png" alt="aerosentinel logo">
</p>

#

Welcome to the AeroSentinel Web-Based Flight Viewer repository. This project is a web application developed in HTML, CSS, and JavaScript to provide a dynamic, real-time visualization of rocket flight data, including 3D models, telemetry, and trajectory.

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
3. [Features](#features)
4. [Software Architecture](#software-architecture)
5. [Key Technologies](#key-technologies)
6. [Current Project Status](#current-project-status)
7. [Contributing](#contributing)
8. [License](#license)

## Introduction
The AeroSentinel Web-Based Flight Viewer is designed to provide an interactive and comprehensive interface for visualizing rocket flight data. The application includes a live 3D model viewer, telemetry data visualization, and trajectory mapping through Google Earth. This tool aims to enhance the user experience by enabling real-time flight monitoring and analysis for rocketry enthusiasts and engineers.

## Getting Started

### Prerequisites
Before getting started, make sure you have the following installed:

- A modern web browser (e.g., Google Chrome, Firefox, Microsoft Edge)
- Basic knowledge of HTML, CSS, and JavaScript

### Installation
1. Clone this repository to your local machine.
2. Navigate into the project directory
3. Open the index.html file in your preferred browser (Live Server extension on VSCode is a simple way to do that)

## Features
- **3D Rocket Model Viewer**: Displays a real-time 3D model of the rocket, allowing users to visualize its orientation and status during the flight.
- **Google Earth Trajectory Mapping**: Integrates with Google Earth to display the rocket's trajectory in real time.
- **Real-Time Telemetry Data**: Shows essential flight data such as altitude, velocity, acceleration, and orientation.
- **Data Upload and Analysis**: Allows users to upload flight data files and visualize them through interactive graphs and tables.
- **Playback Controls**: Provides controls to play, pause, and rewind the flight data playback.

## Software Architecture

The AeroSentinel Flight Viewer is structured with a modular and maintainable front-end architecture. It consists of the following components:

- **3D Model Viewer**: Built using the Three.js library to render and animate the rocket model.
- **Trajectory Viewer**: Uses the Google Earth Web API to display the rocket’s flight path.
- **Data Management**: Handles the parsing and processing of telemetry data files.
- **User Interface**: Built with HTML, CSS, and JavaScript to provide a responsive and interactive user experience.

## Key Technologies
- **Three.js**: For rendering 3D models and animations.
- **jQuery**: For simplified DOM manipulation and event handling.
- **Google Earth API**: For real-time trajectory visualization.

## Current Project Status
In development

## Contributing
Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md) when making contributions to this project.

## License
This project is licensed under the [BSD 3-Clause License](LICENSE).
