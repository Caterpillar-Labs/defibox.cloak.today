// src/components/dropdown/Dropdown.tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DropdownProps } from "../../types/dropdownTypes";
import { connectedInputGroupEmbeddedDropdownStyle, resolveConnectedInputGroupBorderColor } from "../../lib/connectedInputGroupStyles";

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  arrowType = "horizontal",
  style,
  showLabel = false,
  openDirection = "down",
  icon,
  hideArrow = false,
  controlledIsOpen,
  onOpenChange,
  connectedRight = false,
  connectedLeft = false,
  embeddedInGroup = false,
  height,
  groupFocused = false,
  groupHovered = false,
  onGroupFocus,
  onGroupBlur,
  onGroupMouseEnter,
  onGroupMouseLeave,
  enableSearch = true,
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 400,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInModal = useRef(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const isFormLikeDropdown = className.includes("form-like-dropdown");

  const setIsOpen = (nextOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    const updateMobileViewport = () => {
      setIsMobileViewport(window.innerWidth <= 768);
    };

    updateMobileViewport();
    window.addEventListener("resize", updateMobileViewport);
    return () => {
      window.removeEventListener("resize", updateMobileViewport);
    };
  }, []);

  useEffect(() => {
    if (buttonRef.current) {
      let element = buttonRef.current.parentElement;
      while (element) {
        if (element.classList.contains("modal-overlay")) {
          isInModal.current = true;
          break;
        }
        element = element.parentElement;
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      if (buttonRef.current && !isFormLikeDropdown) {
        buttonRef.current.blur();
        buttonRef.current.style.borderColor = "var(--dropdown-border)";
      }
    } else if (isOpen && enableSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, enableSearch, isFormLikeDropdown]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const margin = 16;
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          const top = openDirection === "up" ? rect.top : rect.bottom;
          let left = rect.left;
          let width = rect.width;
          let maxHeight = 400;

          if (isInModal.current) {
            const spaceBelow = viewportHeight - rect.bottom - margin;
            const spaceAbove = rect.top - margin;

            if (openDirection === "up") {
              maxHeight = Math.min(400, spaceAbove);
            } else {
              maxHeight = Math.min(400, spaceBelow);
            }

            if (left + width > viewportWidth - margin) {
              left = Math.max(margin, viewportWidth - width - margin);
            }
            if (left < margin) {
              left = margin;
              width = Math.min(width, viewportWidth - margin * 2);
            }
          } else {
            const spaceBelow = viewportHeight - rect.bottom - margin;
            const spaceAbove = rect.top - margin;

            if (openDirection === "up") {
              maxHeight = Math.min(400, spaceAbove);
            } else {
              maxHeight = Math.min(400, spaceBelow);
            }
          }

          setDropdownPosition({
            top,
            left,
            width,
            maxHeight,
          });
        }
      };
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen, openDirection]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const isLanguageSelector = className.includes("language-selector");
  const isHeroLanguageSelector = className.includes("hero-language-selector");
  const hasScrollbar = className.includes("language-selector-with-scrollbar");
  const isMobileLanguageSelector = isLanguageSelector && isMobileViewport;
  const flagHeight = "1.25rem";
  const flagWidth = isLanguageSelector && !showLabel ? "1.875rem" : "1.25rem";
  const heroFlagWidth = "24px";
  const heroFlagHeight = "16px";
  const activeFlagWidth = isHeroLanguageSelector ? heroFlagWidth : flagWidth;
  const activeFlagHeight = isHeroLanguageSelector ? heroFlagHeight : flagHeight;

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const extractTextFromLabel = (label: React.ReactNode): string => {
    if (typeof label === "string") {
      return label.toLowerCase();
    }
    if (typeof label === "number") {
      return label.toString().toLowerCase();
    }
    if (React.isValidElement(label)) {
      const labelProps = label.props as { children?: React.ReactNode };
      const children = labelProps.children;
      if (typeof children === "string") {
        return children.toLowerCase();
      }
      if (Array.isArray(children)) {
        return children
          .map((child) => {
            if (typeof child === "string") return child;
            if (React.isValidElement(child) && child.type === "span") {
              const spanProps = child.props as { children?: React.ReactNode };
              const spanChild = spanProps.children;
              return typeof spanChild === "string" ? spanChild : "";
            }
            return "";
          })
          .join(" ")
          .toLowerCase();
      }
      if (React.isValidElement(children)) {
        return extractTextFromLabel(children);
      }
    }
    return "";
  };

  const filteredOptions =
    enableSearch && searchTerm
      ? options.filter((option) => {
          const searchLower = searchTerm.toLowerCase();
          const valueMatch = option.value.toLowerCase().includes(searchLower);
          const labelText = extractTextFromLabel(option.label);
          return valueMatch || labelText.includes(searchLower);
        })
      : options;

  const hasWidthInStyle = style?.width !== undefined;
  const hasWidthInClassName = className && /w-\[|w-\d+|width:/i.test(className);
  const defaultWidth = hasWidthInStyle || hasWidthInClassName ? undefined : "100%";

  useEffect(() => {
    if (!buttonRef.current || isFormLikeDropdown || isHeroLanguageSelector) return;
    if (embeddedInGroup) {
      buttonRef.current.style.borderRightColor = resolveConnectedInputGroupBorderColor(groupFocused || groupHovered);
      return;
    }
    const currentBorderColor = groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)";
    if (connectedRight || connectedLeft) {
      buttonRef.current.style.borderTopColor = currentBorderColor;
      buttonRef.current.style.borderBottomColor = currentBorderColor;
      if (connectedLeft) {
        buttonRef.current.style.borderLeft = `1px solid ${currentBorderColor}`;
      }
      if (connectedRight) {
        buttonRef.current.style.borderRight = `1px solid ${currentBorderColor}`;
      }
    } else {
      buttonRef.current.style.borderColor = currentBorderColor;
    }
  }, [groupFocused, groupHovered, connectedRight, connectedLeft, embeddedInGroup, isFormLikeDropdown, isHeroLanguageSelector]);

  const renderOptionIcon = (iconSrc: string) => (
    <img
      src={iconSrc}
      width={20}
      height={20}
      style={{
        height: activeFlagHeight,
        width: activeFlagWidth,
        minHeight: activeFlagHeight,
        minWidth: activeFlagWidth,
        maxHeight: activeFlagHeight,
        maxWidth: activeFlagWidth,
        objectFit: "cover",
        flexShrink: 0,
        display: "block",
        borderRadius: "2px",
      }}
      alt=""
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );

  return (
    <div
      className={`cloak-dropdown ${isOpen ? "is-open" : ""} ${className}`}
      style={{
        position: "relative",
        width: defaultWidth,
        height: height || style?.height,
        ...style,
      }}>
      <button
        ref={buttonRef}
        type="button"
        className="cloak-dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          width: "100%",
          padding: isHeroLanguageSelector ? "0" : icon && hideArrow ? "0.75rem" : isLanguageSelector ? "0.5rem 1.25rem" : isFormLikeDropdown ? "0.75rem 1rem" : "10px 12px",
          background: isHeroLanguageSelector ? "var(--bg-surface-soft)" : "var(--dropdown-bg)",
          position: "relative",
          ...(embeddedInGroup
            ? connectedInputGroupEmbeddedDropdownStyle(resolveConnectedInputGroupBorderColor(groupFocused || groupHovered))
            : isHeroLanguageSelector
              ? {
                  border: "1px solid var(--border-dark)",
                  borderRadius: "999px",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.08)",
                }
              : {
                border: connectedRight || connectedLeft ? "none" : `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}`,
                borderTop: connectedRight || connectedLeft ? `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}` : undefined,
                borderBottom: connectedRight || connectedLeft ? `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}` : undefined,
                borderLeft: connectedLeft ? `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}` : connectedRight ? `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}` : undefined,
                borderRight: connectedRight ? `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}` : connectedLeft ? `1px solid ${groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)"}` : undefined,
                borderRadius: isHeroLanguageSelector ? "999px" : icon && hideArrow ? "0.625rem" : isLanguageSelector ? "9999px" : connectedRight && connectedLeft ? "0" : connectedRight ? "0.625rem 0 0 0.625rem" : connectedLeft ? "0 0.625rem 0.625rem 0" : "0.625rem",
              }),
          color: "var(--dropdown-text)",
          fontSize: "1rem",
          fontFamily: "Arial, Helvetica, sans-serif",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease-out",
          textAlign: icon && hideArrow ? "center" : "left",
          display: "flex",
          justifyContent: isHeroLanguageSelector || (icon && hideArrow) ? "center" : "space-between",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
          height: icon && hideArrow ? "auto" : height ? height : connectedRight || connectedLeft ? "100%" : undefined,
          aspectRatio: icon && hideArrow ? "1" : undefined,
          boxSizing: "border-box",
          outline: "none",
        }}
        onFocus={(e) => {
          if (!disabled) {
            onGroupFocus?.();
            if (embeddedInGroup || isFormLikeDropdown || isHeroLanguageSelector) return;
            const focusBorderColor = "var(--dropdown-border-active)";
            if (connectedRight || connectedLeft) {
              e.currentTarget.style.borderTopColor = focusBorderColor;
              e.currentTarget.style.borderBottomColor = focusBorderColor;
              if (connectedLeft) {
                e.currentTarget.style.borderLeft = `1px solid ${focusBorderColor}`;
              }
              if (connectedRight) {
                e.currentTarget.style.borderRight = `1px solid ${focusBorderColor}`;
              }
            } else {
              e.currentTarget.style.borderColor = focusBorderColor;
            }
          }
        }}
        onBlur={(e) => {
          onGroupBlur?.();
          if (embeddedInGroup || isFormLikeDropdown || isHeroLanguageSelector) return;
          const currentBorderColor = groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)";
          if (connectedRight || connectedLeft) {
            e.currentTarget.style.borderTopColor = currentBorderColor;
            e.currentTarget.style.borderBottomColor = currentBorderColor;
            if (connectedLeft) {
              e.currentTarget.style.borderLeft = `1px solid ${currentBorderColor}`;
            }
            if (connectedRight) {
              e.currentTarget.style.borderRight = `1px solid ${currentBorderColor}`;
            }
          } else {
            e.currentTarget.style.borderColor = currentBorderColor;
          }
        }}
        onMouseEnter={(e) => {
          onGroupMouseEnter?.();
          if (!disabled && !isOpen && isHeroLanguageSelector) {
            e.currentTarget.style.borderColor = "var(--border-strong)";
            e.currentTarget.style.background = "var(--bg-surface-strong)";
          }
          if (!disabled && !isOpen && !isFormLikeDropdown && !isHeroLanguageSelector) {
            const hoverBorderColor = groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)";
            if (connectedRight || connectedLeft) {
              e.currentTarget.style.borderTopColor = hoverBorderColor;
              e.currentTarget.style.borderBottomColor = hoverBorderColor;
              if (connectedLeft) {
                e.currentTarget.style.borderLeft = `1px solid ${hoverBorderColor}`;
              }
              if (connectedRight) {
                e.currentTarget.style.borderRight = `1px solid ${hoverBorderColor}`;
              }
            } else {
              e.currentTarget.style.borderColor = hoverBorderColor;
            }
          }
        }}
        onMouseLeave={(e) => {
          onGroupMouseLeave?.();
          if (!isOpen && isHeroLanguageSelector) {
            e.currentTarget.style.borderColor = "var(--border-dark)";
            e.currentTarget.style.background = "var(--bg-surface-soft)";
          }
          if (!isOpen && !isFormLikeDropdown && !isHeroLanguageSelector) {
            const currentBorderColor = groupFocused || groupHovered ? "var(--dropdown-border-active)" : "var(--dropdown-border)";
            if (connectedRight || connectedLeft) {
              e.currentTarget.style.borderTopColor = currentBorderColor;
              e.currentTarget.style.borderBottomColor = currentBorderColor;
              if (connectedLeft) {
                e.currentTarget.style.borderLeft = `1px solid ${currentBorderColor}`;
              }
              if (connectedRight) {
                e.currentTarget.style.borderRight = `1px solid ${currentBorderColor}`;
              }
            } else {
              e.currentTarget.style.borderColor = currentBorderColor;
            }
          }
        }}>
        <div
          className={isHeroLanguageSelector ? "hero-language-trigger-content" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: isHeroLanguageSelector || (icon && hideArrow) ? "0" : isLanguageSelector && !showLabel ? "0.75rem" : "0.5rem",
            flex: isHeroLanguageSelector || (icon && hideArrow) ? "none" : 1,
            minWidth: 0,
            justifyContent: isHeroLanguageSelector || (icon && hideArrow) ? "center" : "flex-start",
            width: isHeroLanguageSelector || (icon && hideArrow) ? "100%" : "auto",
            height: isHeroLanguageSelector ? "100%" : undefined,
          }}>
          {icon && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: icon && hideArrow ? "100%" : "auto",
                height: icon && hideArrow ? "100%" : "auto",
                minWidth: icon && hideArrow ? "100%" : undefined,
                minHeight: icon && hideArrow ? "100%" : undefined,
              }}>
              {icon}
            </span>
          )}
          {selectedOption?.icon && !icon && renderOptionIcon(selectedOption.icon)}
          {(!isLanguageSelector || showLabel) && (
            <span
              style={
                typeof (selectedOption ? selectedOption.label : placeholder) === "string"
                  ? {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }
                  : {
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                      flex: 1,
                    }
              }>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>
        {!hideArrow && (!isLanguageSelector || showLabel) && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: arrowType === "vertical" ? (isOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%) rotate(0deg)") : isOpen ? "translateY(-50%) rotate(90deg)" : "translateY(-50%) rotate(-90deg)",
              transition: "transform 0.3s ease",
              fontSize: isLanguageSelector && !showLabel ? "0.75rem" : "0.875rem",
              display: "inline-block",
              flexShrink: 0,
              color: "var(--dropdown-text-muted)",
              pointerEvents: "none",
            }}>
            {arrowType === "vertical" ? "▼" : "▶"}
          </span>
        )}
      </button>

      {isOpen &&
        (() => {
          const dropdownContent = (
            <div
              ref={dropdownRef}
              role="listbox"
              className="cloak-dropdown-list"
              onWheel={(e) => {
                e.stopPropagation();
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                const deltaY = e.deltaY;

                if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
                  e.preventDefault();
                }
              }}
              onWheelCapture={(e) => {
                e.stopPropagation();
              }}
              style={{
                position: isInModal.current ? "fixed" : "absolute",
                ...(isInModal.current
                  ? {
                      top: openDirection === "up" ? "auto" : `${dropdownPosition.top + 4}px`,
                      bottom: openDirection === "up" ? `${window.innerHeight - dropdownPosition.top - 4}px` : "auto",
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                      transform: openDirection === "up" ? "translateY(-100%)" : "none",
                      maxHeight: `${dropdownPosition.maxHeight}px`,
                    }
                  : {
                      [openDirection === "up" ? "bottom" : "top"]: "100%",
                      left: 0,
                      right: 0,
                      maxHeight: `${dropdownPosition.maxHeight}px`,
                    }),
                marginTop: openDirection === "up" ? "0" : "0",
                marginBottom: openDirection === "up" ? "0" : "0",
                background: "var(--dropdown-bg)",
                border: "1px solid var(--dropdown-border)",
                borderRadius: "0.875rem",
                boxShadow: "var(--dropdown-shadow)",
                zIndex: isLanguageSelector ? 10002 : 10000,
                overflowY: isLanguageSelector && !hasScrollbar && !isMobileLanguageSelector ? "hidden" : "auto",
                overflowX: "hidden",
                animation: "fadeInZoom 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                padding: isHeroLanguageSelector ? "4px" : "0.5rem",
                scrollbarWidth: isLanguageSelector && !hasScrollbar && !isMobileLanguageSelector ? "none" : "auto",
                msOverflowStyle: isLanguageSelector && !hasScrollbar && !isMobileLanguageSelector ? "none" : "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
              }}>
              {enableSearch ? (
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchTerm("");
                      e.stopPropagation();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: "100%",
                    padding: isMobileLanguageSelector ? "12px 14px" : "10px 12px",
                    background: "var(--dropdown-bg)",
                    border: "1px solid var(--dropdown-border)",
                    borderRadius: "0.625rem",
                    color: "var(--dropdown-text)",
                    fontSize: isMobileLanguageSelector ? "1rem" : "0.9375rem",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    marginBottom: "0.75rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--dropdown-border)";
                  }}
                />
              ) : null}
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    color: "var(--dropdown-text-faint)",
                    fontSize: "0.9375rem",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    textAlign: "center",
                  }}>
                  No results found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    title={isLanguageSelector && typeof option.label === "string" ? option.label : undefined}
                    style={{
                      width: "100%",
                      padding: isHeroLanguageSelector
                        ? "10px"
                        : isLanguageSelector && !showLabel
                          ? isMobileLanguageSelector
                            ? "0.95rem 1.35rem"
                            : "0.75rem 1.25rem"
                          : isMobileLanguageSelector
                            ? "12px 12px"
                            : "10px 10px",
                      background: value === option.value ? "var(--dropdown-option-selected-bg)" : "transparent",
                      border: value === option.value ? "1px solid var(--accent)" : "1px solid transparent",
                      color: option.disabled ? "var(--dropdown-text-faint)" : value === option.value ? "var(--dropdown-text)" : "var(--dropdown-text-muted)",
                      fontSize: isMobileLanguageSelector ? "1rem" : "0.9375rem",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      cursor: option.disabled ? "not-allowed" : "pointer",
                      textAlign: isHeroLanguageSelector ? "center" : "left",
                      transition: "all 0.2s ease-out",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isHeroLanguageSelector ? "center" : "flex-start",
                      borderRadius: isHeroLanguageSelector ? "999px" : "0.625rem",
                      fontWeight: value === option.value ? 600 : 400,
                      marginBottom: index < filteredOptions.length - 1 ? (isHeroLanguageSelector ? "4px" : "0.5rem") : "0",
                      position: "relative",
                      minHeight: isHeroLanguageSelector ? "36px" : isMobileLanguageSelector ? "48px" : undefined,
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={(e) => {
                      if (!option.disabled && value !== option.value) {
                        e.currentTarget.style.background = "var(--dropdown-option-hover-bg)";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.color = "var(--dropdown-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (value !== option.value) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.color = "var(--dropdown-text-muted)";
                      }
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: isHeroLanguageSelector ? "0" : isLanguageSelector && !showLabel ? "0.75rem" : "0.5rem",
                        flex: isHeroLanguageSelector ? "none" : 1,
                        minWidth: 0,
                        justifyContent: isHeroLanguageSelector || (isLanguageSelector && !showLabel) ? "center" : "flex-start",
                        width: isHeroLanguageSelector ? "auto" : undefined,
                      }}>
                      {option.icon && renderOptionIcon(option.icon)}
                      {(!isLanguageSelector || showLabel) && (
                        <span
                          style={{
                            flex: 1,
                            lineHeight: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {option.label}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          );

          return typeof window !== "undefined" && isInModal.current ? createPortal(dropdownContent, document.body) : dropdownContent;
        })()}
    </div>
  );
}
