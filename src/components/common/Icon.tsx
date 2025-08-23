import React from 'react'
import styled from 'styled-components'

interface IconProps {
  src: string
  width?: number
  height?: number
  alt?: string
  onClick?: () => void
  className?: string
}

const IconWrapper = styled.div<{
  $width?: number
  $height?: number
  $clickable?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => ($width ? `${$width}px` : 'auto')};
  height: ${({ $height }) => ($height ? `${$height}px` : 'auto')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: ${({ $clickable }) => ($clickable ? 0.8 : 1)};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const Icon: React.FC<IconProps> = ({
  src,
  width,
  height,
  alt = '',
  onClick,
  className,
}) => {
  const [error, setError] = React.useState(false)

  if (error) {
    return null
  }

  return (
    <IconWrapper
      $width={width}
      $height={height}
      $clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        width={width}
        height={height}
      />
    </IconWrapper>
  )
}

export default Icon