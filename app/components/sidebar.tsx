import React, { useState } from 'react';
import styles from './sidebar.module.css';
import { useConversation } from '../contexts/ConversationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState([{ key: 1, name: '会話 1' }]);
  const { conversationIndex, setConversationIndex, chatLength, setChatLength } = useConversation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const addConversation = () => {
    const newConversation = { key: chatLength, name: `会話 ${chatLength}` };
    setConversationIndex(chatLength);
    setConversations(prev => [...prev, newConversation]);
    setChatLength(chatLength + 1);
  };

  const handleConversationClick = (key: number) => {
    const conversationIndex = conversations.findIndex(c => c.key === key);
    setConversationIndex(key);
  };

  const removeConversation = (key: number) => {
    const index = conversations.findIndex(conversation => conversation.key === key);
    if (conversations.length <= 1) return;

    if (conversationIndex === key) {
      let newActiveConversationKey: number;
      if (index === 0 && conversations.length > 1) {
        newActiveConversationKey = conversations[index + 1].key;
      } else {
        newActiveConversationKey = conversations[index - 1].key;
      }
      setConversationIndex(newActiveConversationKey);
    }

    setConversations(prev => prev.filter(conversation => conversation.key !== key));
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <div className={styles.toggleButton} onClick={toggleSidebar}>
        {isOpen ? <FontAwesomeIcon icon={faAngleDoubleLeft} /> : <FontAwesomeIcon icon={faAngleDoubleRight} />}
      </div>
      <div className={`${styles.sidebarContent} ${isOpen ? '' : styles.closed}`}>
        <div className={styles.header}>
          <h2>会話一覧</h2>
        </div>
        <ul className={styles.conversationList}>
          {conversations.map((conversation) => (
            <li key={conversation.key}
                className={`${styles.conversationItem} ${conversation.key === conversationIndex ? styles.active : ''}`}
                onClick={() => handleConversationClick(conversation.key)}>
              {conversation.name}
              <span className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConversation(conversation.key);
                    }}>
                X
              </span>
            </li>
          ))}
        </ul>
        <button onClick={addConversation} className={styles.addButton}>
          +
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
