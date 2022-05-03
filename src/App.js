import * as Icons from "./Icons";
import * as React from "react";
import {
  motion,
  LayoutGroup,
  useMotionValue,
  animate,
  useTransform,
  useMotionTemplate,
  useDragControls,
} from "framer-motion";

const DURATION = 186;

function App() {
  let [playing, setPlaying] = React.useState(false);
  let [currentTime, setCurrentTime] = React.useState(0);

  return (
    <div className="flex justify-center bg-gray-600 items-center min-h-screen">
      <div className=" max-w-[390px]  w-full flex mx-auto flex-col relative shadow-2xl overflow-hidden overflow-y-scroll sm:rounded-xl">
        <div className="flex flex-col items-center flex-1 w-full px-6 shadow-2xl">
          <Header />

          <motion.img
            src="./album.webp"
            initial={false}
            animate={playing ? "grow" : "shrink"}
            variants={{
              grow: {
                scale: 1,
                transition: {
                  type: "spring",
                  duration: 1,
                  bounce: 0.5,
                  delay: 0.05,
                },
              },
              shrink: {
                scale: 0.73,
                transition: {
                  type: "spring",
                  duration: 0.7,
                  bounce: 0,
                  delay: 0.05,
                },
              },
            }}
            className="relative z-10 block w-full shadow-2xl rounded-xl aspect-square"
          />

          <div className=" mt-[45px] w-full px-2">
            <Title />
            <LayoutGroup>
              <ProgressBar
                playing={playing}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
              />

              <PlayerControls
                playing={playing}
                onPlayPause={() => setPlaying(!playing)}
              />
            </LayoutGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

function Header() {
  return (
    <div className="w-full pt-3 mb-8">
      <div className="flex items-center justify-between pl-3 pr-1 ">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-white text-[17px]">
            {new Date().toLocaleTimeString()}
          </span>
          <Icons.Location className="w-[13px] text-white" />
        </div>
        <div className="flex items-center space-x-1.5">
          <Icons.Signal className="h-[18px] text-white" />
          <Icons.Wifi className="h-[22px] text-white" />
          <Icons.Battery className="h-[24px] text-white" />
        </div>
      </div>
      <div className="mt-4 w-10 h-[5px] mx-auto rounded-full bg-white/20"></div>
    </div>
  );
}

function Title() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xl  font-medium leading-tight text-black truncate">
          You Right
        </p>
        <p className=" text-xl leading-tight truncate text-[#A49FC3]/90">
          Doja Cat & The Weeknd
        </p>
      </div>
      <button className="flex items-center justify-center rounded-full w-7 h-7 bg-white/10 active:bg-white/20">
        <Icons.Dots className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

function ProgressBar({ playing, currentTime, setCurrentTime }) {
  let [dragging, setDragging] = React.useState(false);
  let constraintsRef = React.useRef();
  let fullBarRef = React.useRef();
  let scrubberRef = React.useRef();
  let scrubberX = useMotionValue(0);
  let currentTimePrecise = useMotionValue(currentTime);
  let progressPrecise = useTransform(
    currentTimePrecise,
    (v) => (v / DURATION) * 100
  );
  let progressPreciseWidth = useMotionTemplate`${progressPrecise}%`;
  let dragControls = useDragControls();

  let mins = Math.floor(currentTime / 60);
  let secs = `${currentTime % 60}`.padStart(2, "0");
  let timecode = `${mins}:${secs}`;
  let minsRemaining = Math.floor((DURATION - currentTime) / 60);
  let secsRemaining = `${(DURATION - currentTime) % 60}`.padStart(2, "0");
  let timecodeRemaining = `${minsRemaining}:${secsRemaining}`;
  let progress = (currentTime / DURATION) * 100;

  useInterval(
    () => {
      if (currentTime < DURATION) {
        setCurrentTime((t) => t + 1);
      }
    },
    playing ? 1000 : null
  );

  useInterval(
    () => {
      if (currentTime < DURATION) {
        currentTimePrecise.set(currentTimePrecise.get() + 0.01);
        let newX = getXFromProgress({
          containerRef: fullBarRef,
          progress: currentTimePrecise.get() / DURATION,
        });
        scrubberX.set(newX);
      }
    },
    playing ? 10 : null
  );

  return (
    <div className="relative w-full mt-[25px]">
      <div
        className="relative"
        onPointerDown={(event) => {
          let newProgress = getProgressFromX({
            containerRef: fullBarRef,
            x: event.clientX,
          });
          dragControls.start(event, { snapToCursor: true });
          setCurrentTime(Math.floor(newProgress * DURATION));
          currentTimePrecise.set(newProgress * DURATION);
        }}
      >
        <div
          ref={fullBarRef}
          className="w-full h-[3px] bg-[#5A526F] rounded-full"
        ></div>
        <motion.div
          layout
          style={{ width: progressPreciseWidth }}
          className="absolute top-0"
        >
          <div className="absolute inset-0 h-[3px] bg-[#A29CC0] rounded-full"></div>
        </motion.div>
        <div
          className="absolute inset-0 -ml-[15px] -mr-[17px]"
          ref={constraintsRef}
        >
          <motion.button
            ref={scrubberRef}
            drag="x"
            dragConstraints={constraintsRef}
            dragControls={dragControls}
            dragElastic={0}
            dragMomentum={false}
            style={{ x: scrubberX }}
            onDrag={() => {
              let scrubberBounds = scrubberRef.current.getBoundingClientRect();
              let middleOfScrubber =
                scrubberBounds.x + scrubberBounds.width / 2;
              let newProgress = getProgressFromX({
                containerRef: fullBarRef,
                x: middleOfScrubber,
              });
              setCurrentTime(Math.floor(newProgress * DURATION));
              currentTimePrecise.set(newProgress * DURATION);
            }}
            onDragStart={() => {
              setDragging(true);
            }}
            onPointerDown={() => {
              setDragging(true);
            }}
            onPointerUp={() => {
              setDragging(false);
            }}
            onDragEnd={() => {
              setDragging(false);
            }}
            className="absolute flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing"
          >
            <motion.div
              animate={{ scale: dragging ? 1 : 0.25 }}
              transition={{ type: "tween", duration: 0.15 }}
              initial={false}
              className="w-[33px] h-[33px] bg-[#A29CC0] rounded-full -mt-[15px]"
            ></motion.div>
          </motion.button>
        </div>
      </div>
      <div className="flex justify-between mt-[11px]">
        <motion.p
          className="absolute left-0 text-[11px] font-medium tracking-wide text-white/20 tabular-nums"
          animate={{ y: dragging && progress < 12 ? 15 : 0 }}
        >
          {timecode}
        </motion.p>
        <img
          className="h-[11.5px] mt-1 mx-auto pointer-events-none"
          src="/dolby.svg"
          alt=""
        />
        <motion.p
          className="absolute right-0 text-[11px] font-medium tracking-wide text-white/20 tabular-nums"
          animate={{ y: dragging && progress > 85 ? 15 : 0 }}
        >
          -{timecodeRemaining}
        </motion.p>
      </div>
    </div>
  );
}

function PlayerControls({ playing, onPlayPause }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-4">
        <Button className="w-20 h-20 p-3">
          <Icons.Skip className="w-[42px] h-[42px] text-white rotate-180" />
        </Button>

        <Button onClick={onPlayPause} className="w-20 h-20 p-3">
          {playing ? (
            <Icons.Pause className="w-full h-full" />
          ) : (
            <Icons.Play className="w-full h-full" />
          )}
        </Button>

        <Button className="w-20 h-20 p-3">
          <Icons.Skip className="w-[42px] h-[42px] text-white" />
        </Button>
      </div>
    </div>
  );
}
function Button({ children, onClick = () => {}, className }) {
  let [pressing, setPressing] = React.useState(false);

  return (
    <motion.button
      onTapStart={() => {
        setPressing(true);
      }}
      onTap={() => {
        setPressing(false);
        onClick();
      }}
      initial={false}
      animate={pressing ? "pressed" : "unpressed"}
      variants={{
        pressed: {
          scale: 0.85,
          backgroundColor: "rgba(229 231 235 .25)",
          opacity: 0.7,
        },
        unpressed: {
          scale: [null, 0.85, 1],
          opacity: 1,
          backgroundColor: [
            null,
            "rgba(229 231 235 .25)",
            "rgba(229 231 235 0)",
          ],
        },
      }}
      transition={{
        type: "spring",
        duration: 0.3,
        bounce: 0.5,
      }}
      className={`flex items-center justify-center relative text-white rounded-full ${className}`}
    >
      {children}
    </motion.button>
  );
}

function getProgressFromX({ x, containerRef }) {
  let bounds = containerRef.current.getBoundingClientRect();
  let progress = (x - bounds.x) / bounds.width;

  return clamp(progress, 0, 1);
}

function getXFromProgress({ progress, containerRef }) {
  let bounds = containerRef.current.getBoundingClientRect();

  return progress * bounds.width;
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function useInterval(callback, delay) {
  const intervalRef = React.useRef(null);
  const savedCallback = React.useRef(callback);
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  React.useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);
  return intervalRef;
}
