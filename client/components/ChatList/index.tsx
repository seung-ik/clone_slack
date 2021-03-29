import { IChat, IDM } from '@typings/db'
import React, { FC, forwardRef, MutableRefObject, RefObject, useCallback, useRef, VFC } from 'react'
import {ChatZone,Section, StickyHeader} from './styles'
import Chat from '@components/Chat'
import {Scrollbars} from 'react-custom-scrollbars'

interface Props{
  scrollbarRef: RefObject<Scrollbars>;
  chatSections: { [key: string]: (IDM | IChat)[] };
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd : boolean;
}

const ChatList: VFC<Props> = ({ scrollbarRef, isReachingEnd, isEmpty, chatSections, setSize }) => {
  const onScroll = useCallback((value)=>{
    if(value.scrollTop===0){
      console.log('가장 위')
      setSize((prevSize) => prevSize + 1).then(() => {
        // 스크롤 위치 유지
        const current = (scrollbarRef as MutableRefObject<Scrollbars>)?.current;
        if (current) {
          current.scrollTop(current.getScrollHeight() - value.scrollHeight);
        }
      });
      
    }
    if(value.scrollHeight-value.clientHeight===value.scrollTop){
      console.log('가장 아래')
    }

  },[scrollbarRef, isReachingEnd, setSize])

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll} >
        {Object.entries(chatSections).map(([date,chats])=>{
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>  
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
            ))}
          </Section>
        );
        })}
      </Scrollbars>
    </ChatZone>
  )
}

export default ChatList
