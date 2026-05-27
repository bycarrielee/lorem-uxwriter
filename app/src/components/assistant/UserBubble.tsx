interface Props {
  text: string
}

export function UserBubble({ text }: Props) {
  return (
    <div className="bubble-user-wrap">
      <div className="bubble-user">
        {text}
      </div>
    </div>
  )
}
