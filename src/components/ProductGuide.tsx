import React, { useEffect, useRef, useState } from "react";
import "../css/ProductGuide.css";
import type { ProductTourProps, TooltipPosition } from "../types";


const ProductGuide: React.FC<ProductTourProps> = ({ steps, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [position, setPosition] = useState<TooltipPosition | null>(null);
    const [transform, setTransform] = useState<string>("translate(-50%, -100%)");
    const highlightedRef = useRef<HTMLElement | null>(null);
     
    useEffect(() => {
    if (isOpen) {
        setCurrentIndex(0);  
    }
    }, [isOpen]);

    const step = steps[currentIndex];

    useEffect(() => {
    if (!isOpen || !step) {
        if (highlightedRef.current) {
            highlightedRef.current.classList.remove("guide-highlight");
            highlightedRef.current = null;
        }
        setPosition(null);
        return;
    }

    const target = document.querySelector<HTMLElement>(
        `[data-tour-id="${step.id}"]`
    );
    if (highlightedRef.current && highlightedRef.current !== target) {
      highlightedRef.current.classList.remove("guide-highlight");
      highlightedRef.current = null;
    }

    if (!target) {
        setPosition({
            top: window.innerHeight / 2 + window.scrollY,
            left: window.innerWidth / 2 + window.scrollX,
        });
        setTransform("translate(-50%, -50%)");
        return;
    }

    target.scrollIntoView({
        behavior: "smooth",
        block: "center",   
        inline: "center"
    });
    target.classList.add("guide-highlight");
    highlightedRef.current = target;


    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    const viewportCenter = window.innerWidth / 2;
    const targetCenterX = rect.left + rect.width / 2;

    let top: number;
    let left: number;
    let nextTransform: string;

    const placement = step.placement || "auto";

    if (placement === "bottom") {
        top = rect.bottom + scrollY + 16;
        left = rect.left + scrollX + rect.width / 2;
        nextTransform = "translate(-50%, 0%)";
    } else if (placement === "left") {
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - 16;
        nextTransform = "translate(-100%, -50%)";
    } else if (placement === "right") {
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + 16;
        nextTransform = "translate(0%, -50%)";
    } else { //default 
    top = rect.top + scrollY + rect.height / 2;
    if (targetCenterX < viewportCenter) {
        left = rect.right + scrollX + 16;
        nextTransform = "translate(0%, -50%)";
    } else {
        left = rect.left + scrollX - 16;
        nextTransform = "translate(-100%, -50%)";
    }
    }
    setPosition({ top, left });
    setTransform(nextTransform);
    }, [isOpen, step]);

    useEffect(() => {
        return () => {
        if (highlightedRef.current) {
            highlightedRef.current.classList.remove("guide-highlight");
        }
        };
    }, []);

    const handleNext = () => {
        if (currentIndex < steps.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    if (!isOpen || !step) return null;

    return (<>
    <div className="guide-overlay" style={{pointerEvents: "auto"}} onClick={handleSkip}/>
        <div className="guide-container" style={{top: position?.top,left: position?.left,transform,}}>
            <div className="guide-step-label">
                Step {currentIndex + 1} of {steps.length}
            </div>
            <h3 className="guide-title">{step.title}</h3>
            <p className="guide-desc">{step.content}</p>
            <div className="d-flex justify-content-between mt-4 gap-3">
                <button type="button" className="guide-skip-btn" onClick={handleSkip}> 
                    Skip tour 
                </button>
            <div style={{ display: "flex", gap: 8 }}>
                {currentIndex > 0 && (
                <button type="button" onClick={handleBack} className="guide-back-btn">
                    Back
                </button>
                )}
                <button type="button" onClick={handleNext} className="guide-next-btn">
                    {currentIndex === steps.length - 1 ? "Finish" : "Next →"}
                </button>
            </div>
        </div>
     </div>
 </>);
};

export default ProductGuide;
